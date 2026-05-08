package com.clinica.agenda.web;

import com.clinica.agenda.dto.PatientForm;
import com.clinica.agenda.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientWebController {

    private final PatientService patientService;

    @GetMapping
    public String list(@RequestParam(value = "q", required = false) String q, Model model) {
        model.addAttribute("patients", patientService.search(q));
        model.addAttribute("q", q);
        return "patients/list";
    }

    @GetMapping("/new")
    public String form(Model model) {
        if (!model.containsAttribute("form")) model.addAttribute("form", new PatientForm());
        return "patients/new";
    }

    @PostMapping("/new")
    public String create(@Valid @ModelAttribute("form") PatientForm form,
                         BindingResult br,
                         RedirectAttributes ra) {
        if (br.hasErrors()) return "patients/new";
        var saved = patientService.registerNew(form);
        ra.addFlashAttribute("flashSuccess",
                "Paciente registrado. Folio asignado: " + saved.getFolio());
        return "redirect:/patients";
    }
}
