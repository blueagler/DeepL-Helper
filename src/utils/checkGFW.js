export default function () {
  return new Promise((resolve) => {
    fetch('https://speed.cloudflare.com/', { mode: 'no-cors' })
      .then(() => resolve(false))
      .catch(() => resolve(true));
    setTimeout(() => resolve(true), 1500)
  })
}