package com.clinica.agenda.web;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class AuthWebController {

    @GetMapping("/login")
    public String login(@RequestParam(required = false) String error,
                        @RequestParam(required = false) String logout,
                        Model model) {
        if (error != null) model.addAttribute("loginError", "Correo o contrasenia incorrectos.");
        if (logout != null) model.addAttribute("loginInfo",  "Sesion cerrada correctamente.");
        return "auth/login";
    }
}
