package osx

import (
	"os"
	"path/filepath"
)

const parent = "goctl-tool"

type File struct {
	Name    string
	Content string
}

func CreateTempDirAndDo(pattern string, fn func(parent, dir string) error) error {
	dirName, err := os.MkdirTemp("", parent)
	if err != nil {
		return err
	}
	defer func() {
		_ = os.RemoveAll(dirName)
	}()

	dir := filepath.Join(dirName, pattern)
	err = os.Mkdir(dir, 0700)
	if err != nil {
		return err
	}
	return fn(dirName, dir)
}
