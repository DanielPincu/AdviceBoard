export function sanitizeAdvice(advice: any) {
  const obj = advice?.toObject ? advice.toObject() : advice

  if (!obj) return obj

  if (obj.anonymous) {
    delete obj._createdBy
  }

  if (Array.isArray(obj.replies)) {
    obj.replies = obj.replies.map((r: any) => {
      if (r?.anonymous) {
        delete r._createdBy
      }
      return r
    })
  }

  return obj
}