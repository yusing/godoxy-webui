//go:build !production

package webui

import (
	"io/fs"
	"os"
	"path/filepath"
)

func Dist() fs.FS {
	for _, candidate := range []string{
		"webui/dist/client",
		filepath.Join("..", "..", "webui", "dist", "client"),
		filepath.Join("..", "webui", "dist", "client"),
	} {
		if _, err := os.Stat(candidate); err == nil {
			return os.DirFS(candidate)
		}
	}
	return nil
}
