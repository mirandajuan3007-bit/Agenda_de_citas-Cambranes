package com.clinica.agenda.service;

import com.clinica.agenda.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * RF-04 Generacion automatica del ID/folio del paciente.
 * Patron: PAC-YYYYMMDD-NNNN. El sufijo se incrementa hasta encontrar uno libre.
 */
@Component
@RequiredArgsConstructor
public class FolioGenerator {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private final PatientRepository patientRepository;
    private final AtomicInteger counter = new AtomicInteger(1);

    public synchronized String next() {
        String today = LocalDate.now().format(DATE_FMT);
        for (int i = 0; i < 9999; i++) {
            int n = counter.getAndIncrement();
            String folio = "PAC-" + today + "-" + String.format("%04d", n);
            if (patientRepository.findByFolio(folio).isEmpty()) {
                return folio;
            }
        }
        throw new IllegalStateException("No se pudo generar un folio unico.");
    }
}
