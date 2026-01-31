package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

const logo = "🔵"
const name = "Go"

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
	fmt.Fprintf(w, "%s%s - %d - %s%s", logo, name, result, name, logo)
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/plusone/{number}", plusOneHandler).Methods("GET")
	log.Fatal(http.ListenAndServe(":5000", r))
}
