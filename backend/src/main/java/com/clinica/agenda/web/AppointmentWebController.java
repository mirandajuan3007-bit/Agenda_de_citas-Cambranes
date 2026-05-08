package com.clinica.agenda.web;

import com.clinica.agenda.dto.AppointmentForm;
import com.clinica.agenda.dto.CancelForm;
import com.clinica.agenda.dto.RescheduleForm;
import com.clinica.agenda.model.Appointment;
import com.clinica.agenda.repository.*;
import com.clinica.agenda.security.AppUserDetails;
import com.clinica.agenda.service.AppointmentService;
import com.clinica.agenda.service.PatientService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.UUID;

@Controller
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentWebController {

    private final AppointmentService appointmentService;
    private final PatientService patientService;
    private final TherapistRepository therapistRepository;
    private final RoomRepository roomRepository;
    private final SessionTypeRepository sessionTypeRepository;
    private final UserRepository userRepository;

    @GetMapping
    public String list(Model model) {
        model.addAttribute("appointments", appointmentService.listAll());
        return "appointments/list";
    }

    @GetMapping("/new")
    public String create(@RequestParam(value = "type", defaultValue = "THERAPY") String type,
                         Model model) {
        if (!model.containsAttribute("form")) {
            AppointmentForm form = new AppointmentForm();
            form.setAppointmentType(type);
            form.setDurationMinutes(60);
            model.addAttribute("form", form);
        }
        loadCatalogs(model);
        return "appointments/new";
    }

    @PostMapping("/new")
    public String preview(@Valid @ModelAttribute("form") AppointmentForm form,
                          BindingResult br,
                          HttpSession session,
                          Model model,
                          RedirectAttributes ra) {
        if (br.hasErrors()) {
            loadCatalogs(model);
            return "appointments/new";
        }
        // RF-02: guardar en sesion el formulario y enviar al resumen.
        String token = UUID.randomUUID().toString();
        session.setAttribute("pendingAppt:" + token, form);
        return "redirect:/appointments/summary/" + token;
    }

    @GetMapping("/summary/{token}")
    public String summary(@PathVariable String token, HttpSession session, Model model,
                          RedirectAttributes ra) {
        AppointmentForm form = (AppointmentForm) session.getAttribute("pendingAppt:" + token);
        if (form == null) {
            ra.addFlashAttribute("flashError", "La sesion del resumen expiro. Vuelva a capturar la cita.");
            return "redirect:/appointments/new";
        }
        loadCatalogsForSummary(model, form);
        model.addAttribute("form", form);
        model.addAttribute("token", token);
        return "appointments/summary";
    }

    @PostMapping("/confirm/{token}")
    public String confirm(@PathVariable String token,
                          HttpSession session,
                          @AuthenticationPrincipal AppUserDetails principal,
                          RedirectAttributes ra) {
        AppointmentForm form = (AppointmentForm) session.getAttribute("pendingAppt:" + token);
        if (form == null) {
            ra.addFlashAttribute("flashError", "La sesion del resumen expiro. Vuelva a capturar la cita.");
            return "redirect:/appointments/new";
        }
        var actor = userRepository.findById(principal.getId()).orElseThrow();
        Appointment saved = appointmentService.create(form, actor);
        session.removeAttribute("pendingAppt:" + token);
        ra.addFlashAttribute("flashSuccess", "La cita fue registrada correctamente.");
        return "redirect:/appointments/" + saved.getId();
    }

    @PostMapping("/cancel-preview/{token}")
    public String cancelPreview(@PathVariable String token, HttpSession session) {
        session.removeAttribute("pendingAppt:" + token);
        return "redirect:/appointments/new";
    }

    @GetMapping("/{id}")
    public String detail(@PathVariable Long id, Model model) {
        Appointment appt = appointmentService.findById(id);
        model.addAttribute("appt", appt);
        model.addAttribute("isLate", appointmentService.isLate(appt));
        model.addAttribute("rescheduleForm", new RescheduleForm());
        model.addAttribute("cancelForm", new CancelForm());
        loadCatalogs(model);
        return "appointments/detail";
    }

    @PostMapping("/{id}/reschedule")
    public String reschedule(@PathVariable Long id,
                             @Valid @ModelAttribute("rescheduleForm") RescheduleForm form,
                             BindingResult br,
                             @AuthenticationPrincipal AppUserDetails principal,
                             RedirectAttributes ra) {
        if (br.hasErrors()) {
            ra.addFlashAttribute("flashError", "Verifique los datos de la reprogramacion.");
            return "redirect:/appointments/" + id;
        }
        var actor = userRepository.findById(principal.getId()).orElseThrow();
        Appointment fresh = appointmentService.reschedule(id, form, actor);
        ra.addFlashAttribute("flashSuccess", "La cita se reprogramo con exito.");
        return "redirect:/appointments/" + fresh.getId();
    }

    @PostMapping("/{id}/cancel")
    public String cancel(@PathVariable Long id,
                         @Valid @ModelAttribute("cancelForm") CancelForm form,
                         BindingResult br,
                         @AuthenticationPrincipal AppUserDetails principal,
                         RedirectAttributes ra) {
        if (br.hasErrors()) {
            ra.addFlashAttribute("flashError", "Indique el motivo de la cancelacion.");
            return "redirect:/appointments/" + id;
        }
        var actor = userRepository.findById(principal.getId()).orElseThrow();
        appointmentService.cancel(id, form, actor);
        ra.addFlashAttribute("flashSuccess", "La cancelacion se realizo correctamente.");
        return "redirect:/appointments/" + id;
    }

    private void loadCatalogs(Model model) {
        model.addAttribute("patients", patientService.listAll());
        model.addAttribute("therapists", therapistRepository.findByActiveTrueOrderByFullNameAsc());
        model.addAttribute("rooms", roomRepository.findAllByOrderByNameAsc());
        model.addAttribute("sessionTypes", sessionTypeRepository.findAllByOrderByNameAsc());
    }

    private void loadCatalogsForSummary(Model model, AppointmentForm form) {
        loadCatalogs(model);
        if (form.getPatientId() != null) {
            model.addAttribute("selectedPatient", patientService.findById(form.getPatientId()));
        }
        if (form.getTherapistId() != null) {
            therapistRepository.findById(form.getTherapistId())
                    .ifPresent(t -> model.addAttribute("selectedTherapist", t));
        }
        if (form.getRoomId() != null) {
            roomRepository.findById(form.getRoomId())
                    .ifPresent(r -> model.addAttribute("selectedRoom", r));
        }
        if (form.getSessionTypeId() != null) {
            sessionTypeRepository.findById(form.getSessionTypeId())
                    .ifPresent(s -> model.addAttribute("selectedSessionType", s));
        }
    }
}
