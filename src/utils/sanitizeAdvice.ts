export function sanitizeAdvice(advice: any, myUserId?: string) {
  const obj = advice?.toObject ? advice.toObject() : advice
  if (!obj) return obj

  const ownerId =
    obj._createdBy && typeof obj._createdBy === 'object' && (obj._createdBy as any)._id
      ? String((obj._createdBy as any)._id)
      : typeof obj._createdBy === 'string'
        ? String(obj._createdBy)
        : null

  // Safe ownership flag for the client
  obj._isMine = Boolean(myUserId && ownerId && String(myUserId) === ownerId)

  // ALWAYS hide identity if anonymous (never leak _createdBy)
  if (obj.anonymous) {
    delete obj._createdBy
  }

  if (Array.isArray(obj.replies)) {
    obj.replies = obj.replies.map((r: any) => {
      const rr = r?.toObject ? r.toObject() : r

      const replyOwnerId =
        rr?._createdBy && typeof rr._createdBy === 'object' && (rr._createdBy as any)._id
          ? String((rr._createdBy as any)._id)
          : typeof rr?._createdBy === 'string'
            ? String(rr._createdBy)
            : null

      // ALWAYS attach _isMine (true or false)
      rr._isMine = Boolean(myUserId && replyOwnerId && String(myUserId) === replyOwnerId)

      // ALWAYS hide identity if anonymous
      if (rr?.anonymous) {
        delete rr._createdBy
      }

      return rr
    })
  }

  return obj
}