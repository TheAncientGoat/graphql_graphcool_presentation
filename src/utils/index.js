import _ from 'lodash'

export const rawMutation = (apiUrl, mutation) =>
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: new Blob(
          [
            JSON.stringify({ query: mutation.replace(/\n/g, '') })],
          { type: 'application/json' }),
      })
      .then(r => r.json())


export const upsert = (arr, key, newval) => {
  const match = _.find(arr, key)
  if (match) {
    const index = _.indexOf(arr, _.find(arr, key))
    arr.splice(index, 1, newval)
  } else {
    arr.push(newval)
  }
}

export default { rawMutation, upsert }
