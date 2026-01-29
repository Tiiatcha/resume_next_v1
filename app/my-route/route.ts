export const GET = async () => {
  // Intentionally not initialising Payload here.
  // This route is an example "hello world" endpoint and does not need DB access.
  return Response.json({
    message: 'This is an example of a custom route.',
  })
}
