package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"path"
	"strings"
)

func main() {
	var port int
	var staticDir string
	flag.IntVar(&port, "port", 8080, "The port to listen")
	flag.StringVar(&staticDir, "staticdir", "dist", "Static files directory")
	flag.Parse()

	if staticDir == "" {
		log.Fatal("-staticdir is required")
	}

	fs := http.FileServer(http.Dir(staticDir))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/static") {
			fs.ServeHTTP(w, r)
		} else if r.URL.Path == "/" {
			http.ServeFile(w, r, path.Join(staticDir, "index.html"))
		} else if r.URL.Path == "/healthz" {
			fmt.Fprint(w, "ok")
		} else {
			http.Error(w, "Not Found", 404)
		}
	})
	log.Printf("Listening to :%d, staticDir: %s...", port, staticDir)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}
