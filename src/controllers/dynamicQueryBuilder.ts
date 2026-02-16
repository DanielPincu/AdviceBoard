import type { Model } from 'mongoose'
import type mongoose from 'mongoose'
// Works across mongoose versions
type FilterQuery<T> = mongoose.QueryFilter<T>

interface SearchBody {
  key: string
  value: unknown
}


export function buildDynamicQuery<T>(
  model: Model<T>,
  body: SearchBody
): FilterQuery<T> {
  const field = body.key
  const value = body.value

  // Special free-text search across common Advice fields
  if (field === 'q') {
    const text = String(value ?? '').trim()
    if (!text) return {} as FilterQuery<T>

    return {
      $or: [
        { title: { $regex: text, $options: 'i' } },
        { content: { $regex: text, $options: 'i' } },
      ],
    } as unknown as FilterQuery<T>
  }

  const schemaPath = model.schema.path(field)
  if (!schemaPath) {
    throw new Error(`Unknown field: ${field}`)
  }

  let query: FilterQuery<T>

  switch (schemaPath.instance) {
    case 'String':
      query = {
        [field]: { $regex: String(value), $options: 'i' },
      } as FilterQuery<T>
      break

    case 'Number':
      if (typeof value === 'object' && value !== null) {
        query = { [field]: value } as FilterQuery<T>
      } else {
        query = { [field]: Number(value) } as FilterQuery<T>
      }
      break

    case 'Date':
      query = { [field]: new Date(value as string | number) } as FilterQuery<T>
      break

    case 'Boolean':
      query = {
        [field]:
          value === true ||
          value === 'true' ||
          value === 1 ||
          value === '1',
      } as FilterQuery<T>
      break

    default:
      query = { [field]: value } as FilterQuery<T>
  }

  return query
}
