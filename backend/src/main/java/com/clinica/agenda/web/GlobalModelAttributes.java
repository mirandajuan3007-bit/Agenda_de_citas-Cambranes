package com.clinica.agenda.web;

import com.clinica.agenda.security.AppUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice(basePackages = "com.clinica.agenda.web")
public class GlobalModelAttributes {

    @ModelAttribute("currentUser")
    public AppUserDetails currentUser(@AuthenticationPrincipal AppUserDetails principal) {
        return principal;
    }
}
