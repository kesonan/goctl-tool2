package jsonx

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

func Decode(s string, v any) error {
	encoder := json.NewDecoder(strings.NewReader(s))
	encoder.UseNumber()
	err := encoder.Decode(&v)
	if err == nil {
		return nil
	}

	var syntaxErr *json.SyntaxError
	ok := errors.As(err, &syntaxErr)
	if ok {
		return fmt.Errorf("offset: %d, error: %s", syntaxErr.Offset, syntaxErr.Error())
	}

	return err
}
