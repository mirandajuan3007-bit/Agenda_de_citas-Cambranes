package mx.clinica.cambranes.agenda.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI agendaOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("Agenda de Citas - Cambranes")
                .description("API REST del modulo de agenda de la Clinica Psicologica Cambranes. "
                        + "Cubre los casos de uso RF-01 a RF-09: agendar, consultar, reprogramar, "
                        + "cancelar, finalizar citas y gestionar pacientes.")
                .version("1.0.0")
                .contact(new Contact().name("Equipo Cambranes"))
                .license(new License().name("Uso interno")));
    }
}
