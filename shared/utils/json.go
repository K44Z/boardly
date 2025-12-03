package utils

import "encoding/json"

func ConvertTOJson(v any) string {
	str, err := json.Marshal(v)
	if err != nil {
		return ""
	}
	return string(str)
}
