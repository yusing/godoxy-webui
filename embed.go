package webui

import (
	"embed"
	"io/fs"
)

//go:embed all:dist/client
var dist embed.FS

// Dist returns the embedded WebUI client build assets.
func Dist() fs.FS {
	client, err := fs.Sub(dist, "dist/client")
	if err != nil {
		panic(err)
	}
	return client
}
