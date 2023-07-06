import { BlobServiceClient } from "@azure/storage-blob";

export default {
    SECRET: 'pytoAPI',
}

const AZURE_STORAGE_CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=filelogistnet;AccountKey=h1pBVQOfvSjDrn3tKQYaJ0s1b8tMqbMReEt25I7eD07+K6jOTjiGDaCNXBuC8g9gAdthMskJjN2l+AStM5SO3A==;EndpointSuffix=core.windows.net"
export const DOMINIOFILE = "https://filelogistnet.blob.core.windows.net/reportes/"

export const containerReport= "reportes";
export const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);