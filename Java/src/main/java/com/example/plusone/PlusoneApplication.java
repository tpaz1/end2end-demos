package com.example.plusone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Min;

@SpringBootApplication
@RestController
@Validated
public class PlusoneApplication {

    private static final String NAME = "Java";

    private static String getVersion() {
        String v = System.getenv("APP_VERSION");
        return (v != null && !v.isEmpty()) ? v : "1.0.0";
    }

    private static final String INDEX_HTML = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Java · Version</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              min-height: 100vh;
              font-family: 'Segoe UI', system-ui, sans-serif;
              background: linear-gradient(145deg, #1a0a0a 0%, #2d1515 40%, #4a1c1c 100%);
              color: #f5e6e6;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              overflow-x: hidden;
            }
            .card {
              background: rgba(237,139,0,0.08);
              backdrop-filter: blur(16px);
              border: 1px solid rgba(237,139,0,0.3);
              border-radius: 24px;
              padding: 2.5rem;
              max-width: 420px;
              width: 100%;
              text-align: center;
              box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(237,139,0,0.12);
            }
            .logo-wrap {
              width: 140px;
              height: 140px;
              margin: 0 auto 1.5rem;
              display: flex;
              align-items: center;
              justify-content: center;
              animation: steam 3s ease-in-out infinite;
              filter: drop-shadow(0 0 24px rgba(237,139,0,0.5));
            }
            .logo-wrap img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            @keyframes steam {
              0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
              50% { transform: translateY(-8px) scale(1.05); opacity: 0.95; }
            }
            h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; color: #ED8B00; }
            .sub { color: #c4a0a0; font-size: 0.95rem; margin-bottom: 1.5rem; }
            .version-line {
              font-size: 2.75rem;
              font-weight: 700;
              color: #ED8B00;
              margin: 0;
              animation: steam 3s ease-in-out infinite;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo-wrap" aria-hidden="true"><img src="/logo.png" alt="Java"></div>
            <h1>Java</h1>
            <p class="sub">Application version</p>
            <p class="version-line">{{VERSION}}</p>
          </div>
        </body>
        </html>
        """;

    public static void main(String[] args) {
        SpringApplication.run(PlusoneApplication.class, args);
    }

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> index() {
        return ResponseEntity.ok(INDEX_HTML.replace("{{VERSION}}", getVersion()));
    }

    @GetMapping(value = "/version", produces = "text/plain; charset=utf-8")
    public String version() {
        return NAME + " Application version - " + getVersion();
    }

    @GetMapping(value = "/plusone/{number}", produces = "text/plain; charset=utf-8")
    public String plusOne(@PathVariable @Min(0) int number) {
        int result = number + 1;
        return NAME + " - " + result + " - " + NAME;
    }
}
