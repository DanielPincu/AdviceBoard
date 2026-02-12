export function sanitizeAdvice(advice: any, myUserId?: string) {
  const obj = advice?.toObject ? advice.toObject() : advice
  if (!obj) return obj

  // Sanitize advice author
  if (obj._createdBy && obj.anonymous) {
    const ownerId =
      typeof obj._createdBy === 'string'
        ? obj._createdBy
        : obj._createdBy?._id?.toString?.() ?? String(obj._createdBy?._id ?? '')

    if (!myUserId || ownerId !== myUserId) {
      // Keep only _id so frontend can check ownership, hide username
      obj._createdBy = ownerId ? { _id: ownerId } : undefined
    }
  }

  // Sanitize replies authors
  if (Array.isArray(obj.replies)) {
    obj.replies = obj.replies.map((r: any) => {
      if (r?._createdBy && r.anonymous) {
        const ownerId =
          typeof r._createdBy === 'string'
            ? r._createdBy
            : r._createdBy?._id?.toString?.() ?? String(r._createdBy?._id ?? '')

        if (!myUserId || ownerId !== myUserId) {
          r._createdBy = ownerId ? { _id: ownerId } : undefined
        }
      }
      return r
    })
  }

  return obj
}