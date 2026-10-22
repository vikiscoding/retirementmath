// Pages _redirects cannot redirect one hostname to another.
// This sends www.retirementmath.ca to https://retirementmath.ca and keeps the path.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === "www.retirementmath.ca") {
    url.hostname = "retirementmath.ca";
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
