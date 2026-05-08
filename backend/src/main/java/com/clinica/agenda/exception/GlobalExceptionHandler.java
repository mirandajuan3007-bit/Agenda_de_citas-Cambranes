package com.clinica.agenda.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Map;

/**
 * RNF-04: manejo centralizado de excepciones, logging estructurado y respuesta limpia
 * para el usuario final (sin exponer trazas internas).
 */
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public Object handleBusiness(BusinessException ex, HttpServletRequest req, RedirectAttributes ra) {
        log.warn("business_error path={} message={}", req.getRequestURI(), ex.getMessage());
        if (isApi(req)) {
            HttpStatus status = (ex instanceof ConflictException) ? HttpStatus.CONFLICT
                    : (ex instanceof NotFoundException) ? HttpStatus.NOT_FOUND
                    : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(Map.of("error", ex.getMessage()));
        }
        ra.addFlashAttribute("flashError", ex.getMessage());
        String referer = req.getHeader("Referer");
        return new ModelAndView("redirect:" + (referer != null ? referer : "/"));
    }

    @ExceptionHandler(Exception.class)
    public Object handleAny(Exception ex, HttpServletRequest req, Model model) {
        log.error("unhandled_error path={}", req.getRequestURI(), ex);
        if (isApi(req)) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ocurrio un error inesperado."));
        }
        model.addAttribute("flashError",
                "Ocurrio un error inesperado. Vuelva a intentarlo o contacte al administrador.");
        return new ModelAndView("error/generic", model.asMap(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private boolean isApi(HttpServletRequest req) {
        String uri = req.getRequestURI();
        return uri != null && uri.startsWith("/api/");
    }
}
