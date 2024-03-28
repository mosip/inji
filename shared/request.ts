import {DecodedCredential, VerifiableCredential} from '../types/VC/vc';
import {__AppId} from './GlobalVariables';
import {MIMOTO_BASE_URL, REQUEST_TIMEOUT} from './constants';

export type HTTP_METHOD = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export class BackendResponseError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
}

export async function request(
  method: HTTP_METHOD,
  path: `/${string}` | string,
  body?: Record<string, unknown>,
  host = MIMOTO_BASE_URL,
  headers: Record<string, string> = {
    'Content-Type': 'application/json',
  },
  timeoutMillis?: undefined | number,
) {
  if (path.includes('residentmobileapp'))
    headers['X-AppId'] = __AppId.getValue();
  let response;
  const requestUrl = path.indexOf('https://') != -1 ? path : host + path;
  if (timeoutMillis === undefined) {
    response = await fetch(requestUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } else {
    console.log(`making a web request to ${requestUrl}`);
    let controller = new AbortController();
    setTimeout(() => {
      controller.abort();
    }, timeoutMillis);
    try {
      response = await fetch(requestUrl, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (error) {
      console.error(
        `Error occurred while making request: ${host + path}: ${error}`,
      );
      if (error.name === 'AbortError') {
        throw new Error(REQUEST_TIMEOUT);
      }
      throw error;
    }
  }

  const jsonResponse = await response.json();

  if (response.status >= 400) {
    let backendUrl = host + path;
    let errorMessage =
      jsonResponse.message ||
      (typeof jsonResponse.error === 'object'
        ? JSON.stringify(jsonResponse.error)
        : jsonResponse.error);
    console.error(
      `The backend API ${backendUrl} returned error code ${response.status} with message --> ${errorMessage}`,
    );
    throw new Error(errorMessage);
  }

  if (jsonResponse.errors && jsonResponse.errors.length) {
    let backendUrl = host + path;
    const {errorCode, errorMessage} = jsonResponse.errors.shift();
    console.error(
      'The backend API ' +
        backendUrl +
        ' returned error response --> error code is : ' +
        errorCode +
        ' error message is : ' +
        errorMessage,
    );
    throw new BackendResponseError(errorCode, errorMessage);
  }

  return jsonResponse;
}

interface ResponseError {
  errorCode: string;
  errorMessage: string;
}

interface BackendResponse<T> {
  id: string;
  version: string;
  response: T;
  str?: string;
  responsetime?: string;
  metadata?: string;
  errors?: ResponseError[];
}

export type OtpRequestResponse = BackendResponse<{
  maskedMobile?: string;
  maskedEmail?: string;
}>;

export type VcGenerateResponse = BackendResponse<{
  vc: string;
  message: string;
}>;

export type CredentialRequestResponse = BackendResponse<{
  id: string;
  requestId: string;
}>;

export type CredentialStatusResponse = BackendResponse<{
  statusCode: 'NEW' | 'ISSUED' | 'printing';
}>;

export interface CredentialDownloadResponse {
  credential?: DecodedCredential;
  verifiableCredential?: VerifiableCredential;
}
