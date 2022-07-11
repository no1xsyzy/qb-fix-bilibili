export const followersTextClass = (followers: number): [string, string] => {
  if (followers > 1e6) {
    return [`${Math.round(followers / 1e5) / 10}m★`, 'followers-m']
  } else if (followers > 1e3) {
    return [`${Math.round(followers / 1e2) / 10}k★`, 'followers-k']
  } else {
    return [`${followers}★`, 'followers-1']
  }
}
