package com.clinica.agenda.web;

import com.clinica.agenda.config.BusinessProperties;
import com.clinica.agenda.model.Appointment;
import com.clinica.agenda.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.OffsetDateTime;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class DashboardWebController {

    private final AppointmentService appointmentService;
    private final BusinessProperties props;

    @GetMapping("/")
    public String index(Model model) {
        OffsetDateTime now = OffsetDateTime.now(props.zoneId());
        OffsetDateTime in7 = now.plusDays(7);
        List<Appointment> upcoming = appointmentService.listInRange(now.minusHours(12), in7);

        long total   = upcoming.size();
        long lateCnt = upcoming.stream().filter(appointmentService::isLate).count();

        model.addAttribute("upcoming", upcoming);
        model.addAttribute("upcomingCount", total);
        model.addAttribute("lateCount", lateCnt);
        return "dashboard/index";
    }
}
