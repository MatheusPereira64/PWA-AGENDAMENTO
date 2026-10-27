export function parsePage(query: { page?: number; pageSize?: number }) {
  const page = query.page ?? 1
  const pageSize = query.pageSize ?? 20
  return { page, pageSize, skip: (page - 1) * pageSize }
}

export function pageResult<T>(data: T[], total: number, page: number, pageSize: number) {
  return { data, total, page, pageSize }
}
