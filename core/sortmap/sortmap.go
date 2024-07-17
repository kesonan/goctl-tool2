package sortmap

type (
	KVPair[K comparable, V any] struct {
		Key   K
		Value V
	}
	SortMap[K comparable, V any] struct {
		list []*KVPair[K, V]
		m    map[K]int
	}
)

func New[K comparable, V any]() *SortMap[K, V] {
	return &SortMap[K, V]{
		list: []*KVPair[K, V]{},
		m:    make(map[K]int),
	}
}

func From[K comparable, V any](v map[K]V) *SortMap[K, V] {
	m := New[K, V]()
	m.append(v)
	return m
}

func (m *SortMap[K, V]) Range(fn func(idx int, key K, value V) error) error {
	for idx, kv := range m.list {
		if fn != nil {
			err := fn(idx, kv.Key, kv.Value)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func (m *SortMap[K, V]) MustRange(fn func(idx int, key K, value V)) {
	for idx, kv := range m.list {
		if fn != nil {
			fn(idx, kv.Key, kv.Value)
		}
	}
}

func (m *SortMap[K, V]) Del(key K) {
	idx, ok := m.m[key]
	if !ok {
		return
	}
	m.list = append(m.list[:idx], m.list[idx+1:]...)
	delete(m.m, key)
}

func (m *SortMap[K, V]) Get(key K) (val V, ok bool) {
	index, exists := m.m[key]
	if !exists {
		ok = false
		return
	}
	return m.list[index].Value, true
}

func (m *SortMap[K, V]) HasKey(key K) bool {
	_, exists := m.m[key]
	return exists
}

func (m *SortMap[K, V]) Set(key K, val V) {
	idx, ok := m.m[key]
	if ok {
		m.list[idx].Value = val
	} else {
		m.list = append(m.list, &KVPair[K, V]{
			Key:   key,
			Value: val,
		})
		m.m[key] = len(m.list) - 1
	}
}

func (m *SortMap[K, V]) append(v map[K]V) {
	for k, v := range v {
		m.Set(k, v)
	}
}
