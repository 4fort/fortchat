package lib

import "reflect"

func IsStructEmpty(s interface{}) bool {
	return reflect.DeepEqual(s, reflect.New(reflect.TypeOf(s)).Elem().Interface())
}
