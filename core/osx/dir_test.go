package osx

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestCreateTempDirAndDo(t *testing.T) {
	err := CreateTempDirAndDo("test", func(dir string) error {
		fmt.Println(dir)
		return nil
	})
	assert.NoError(t, err)
}
