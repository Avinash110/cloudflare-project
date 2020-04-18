const COOKIE_VARIANT_URL = "variant_url";
const COOKIE_VARIANT_INDEX = "variant_index";
const VARIANTS_URL =  "https://cfw-takehome.developers.workers.dev/api/variants";

/**
  Modifies the html content of variant 1
**/
class DocumentHandlerVariant1 {
  element(element) {
    const tagName = element.tagName;
    switch(tagName) {
      case 'title':
        element.setInnerContent("Cats can dance better than me!")
        break;
      case 'h1':
        element.setAttribute("style", "color: #E69F66")
        element.setInnerContent("Welcome")
        break;
      case 'p':
        element.setAttribute("style", "color: #F92672;")
        element.setInnerContent("In this challenging time here's something that can make you smile.\n Enjoy and stay safe :)")
        break;
      case 'div':
          element.setAttribute("style", "background-color: #272822;")
        break;
      case 'a':
        var href = "https://www.youtube.com/watch?v=hd3dmPvUKWo";
        element.setAttribute("href", href)
        element.setInnerContent("Click Here!")
    }
  }
}

/**
  Modifies the html content of variant 2
**/
class DocumentHandlerVariant2 {
  element(element) {
    const tagName = element.tagName;
    switch(tagName) {
      case 'title':
        element.setInnerContent("Charlie bit me. Again!")
        break;
      case 'h1':
        element.setAttribute("style", "color: #E69F66")
        element.setInnerContent("Welcome")
        break;
      case 'p':
        element.setAttribute("style", "color: #F92672;")
        element.setInnerContent("In this challenging time here's something that can make you smile.\n Enjoy and stay safe :)")
        break;
      case 'div':
          element.setAttribute("style", "background-color: #272822;")
        break;
      case 'a':
        var href = "https://www.youtube.com/watch?v=_OBlgSz8sSM";
        element.setAttribute("href", href)
        element.setInnerContent("Click Here!")
    }
  }
}

/**
 * Modify the response according to the variant
 * @param {Response} response
 * @param {int} type
 * return {Response}
 */

function modifyResponse(response, type){

  let docHandler;
  if(type == 0){
    docHandler = new DocumentHandlerVariant1();
  } else {
    docHandler = new DocumentHandlerVariant2();
  }
  const selectors = ['title', 'h1', 'p', 'a', 'div.bg-white'];
  const htmlRewriter = new HTMLRewriter()

  selectors.forEach(d => {
    htmlRewriter.on(d, docHandler)
  });

  let newResponse = htmlRewriter
    .transform(response)
  return newResponse
}

/**
 * Choose one variant from the two
 * @param {Array[String]} variants
 * return {int}
 */

function chooseVariant(variants){
  let index = 0; 
  const randomNum = Math.random()
  if (randomNum > 0.5 ){
    index = 1
  }
  return index;
}

/**
 * wrapper function to send the response
 * @param {String} variantUrl
 * @param {int} type
 * return {Response}
 */
async function sendResponse(variantUrl, type){
  let response = await fetch(variantUrl)

  let cookie_content = `${COOKIE_VARIANT_URL}=${variantUrl}`;
  response = new Response(response.body, response);
  response.headers.set('Set-Cookie', cookie_content);

  cookie_content = `${COOKIE_VARIANT_INDEX}=${type}`;
  response.headers.set('Set-Cookie', cookie_content);
  
  response = modifyResponse(response, type);
  return response
}

/**
 * gets the two variants
 * return {Array[String]}
 */
async function getVariants(){
  const response = await fetch(VARIANTS_URL)
  const parsed = await response.json()
  return parsed.variants
}

/**
 * function to get the value of cookie from request
 * @param {Request} request
 * @param {String} name
 * return {String}
 */
function getCookie(request, name) {
  let result = null
  let cookieString = request.headers.get('Cookie')
  if (cookieString) {
    let cookies = cookieString.split(';')
    cookies.forEach(cookie => {
      let cookieName = cookie.split('=')[0].trim()
      if (cookieName === name) {
        let cookieVal = cookie.split('=')[1]
        result = cookieVal
      }
    })
  }
  return result
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {  
  const variantValue = getCookie(request, COOKIE_VARIANT_INDEX)
  if (variantValue) {
    return sendResponse(getCookie(request, COOKIE_VARIANT_URL), variantValue)
  }

  const variants = await getVariants();
  const variantIndex = chooseVariant(variants);
  return sendResponse(variants[variantIndex], variantIndex) 
}