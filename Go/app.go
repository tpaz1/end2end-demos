package main

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
)

//go:embed static/*
var staticFS embed.FS

const name = "Go"

func getVersion() string {
	if v := os.Getenv("APP_VERSION"); v != "" {
		return v
	}
	return "1.0.0"
}

const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Go · Version</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(160deg, #0d1117 0%, #161b22 40%, #0d47a1 100%);
      color: #e6edf3;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      overflow-x: hidden;
    }
    .card {
      background: rgba(0,173,216,0.08);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(0,173,216,0.25);
      border-radius: 24px;
      padding: 2.5rem;
      max-width: 420px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(0,173,216,0.15);
    }
    .logo-wrap {
      width: 140px;
      height: 140px;
      margin: 0 auto 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: float 4s ease-in-out infinite;
      filter: drop-shadow(0 0 28px rgba(0,173,216,0.6));
    }
    .logo-wrap img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-10px) scale(1.05); }
    }
    h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; color: #00ADD8; }
    .sub { color: #8b949e; font-size: 0.95rem; margin-bottom: 1.5rem; }
    .version-line {
      font-size: 2.75rem;
      font-weight: 700;
      color: #00ADD8;
      margin: 0;
      animation: float 4s ease-in-out infinite;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-wrap" aria-hidden="true"><img src="/static/logo.png" alt="Go"></div>
    <h1>Go</h1>
    <p class="sub">Application version</p>
    <p class="version-line">{{VERSION}}</p>
  </div>
</body>
</html>
`

func indexHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	html := strings.Replace(indexHTML, "{{VERSION}}", getVersion(), 1)
	w.Write([]byte(html))
}

func plusOneHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	numStr := vars["number"]
	num, err := strconv.Atoi(numStr)
	if err != nil {
		http.Error(w, "invalid number", http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	result := num + 1
	log.Printf("plus_one number=%d result=%d", num, result)
	fmt.Fprintf(w, "%s - %d - %s", name, result, name)
}

func versionHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	fmt.Fprintf(w, "%s Application version - %s", name, getVersion())
}

func main() {
	subFS, _ := fs.Sub(staticFS, "static")
	r := mux.NewRouter()
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.FS(subFS))))
	r.HandleFunc("/", indexHandler).Methods("GET")
	r.HandleFunc("/plusone/{number}", plusOneHandler).Methods("GET")
	r.HandleFunc("/version", versionHandler).Methods("GET")
	log.Fatal(http.ListenAndServe(":5000", r))
}
