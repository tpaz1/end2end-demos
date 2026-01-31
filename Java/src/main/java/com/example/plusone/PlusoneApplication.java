package com.example.plusone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Min;

@SpringBootApplication
@RestController
@Validated
public class PlusoneApplication {

    private static final String LOGO = "☕";
    private static final String NAME = "Java";

    public static void main(String[] args) {
        SpringApplication.run(PlusoneApplication.class, args);
    }

    @GetMapping(value = "/plusone/{number}", produces = "text/plain; charset=utf-8")
    public String plusOne(@PathVariable @Min(0) int number) {
        int result = number + 1;
        return LOGO + NAME + " - " + result + " - " + NAME + LOGO;
    }
}
