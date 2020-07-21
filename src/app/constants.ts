export const queryableFields = {
  name: 'File Name',
  size: 'File Size',
  contentType: 'Type',
  kind: 'Kind',
  timeCreated: 'Time Created',
  updated: 'Time Updated',
  metadata: 'Custom Metadata',
};

export const metadataFields = {
  ...queryableFields,
  bucket: 'bucket',
  contentDisposition: 'contentDisposition',
  crc32c: 'crc32c',
  etag: 'etag',
  generation: 'generation',
  id: 'id',
  md5Hash: 'md5Hash',
  mediaLink: 'mediaLink',
  metageneration: 'metageneration',
  selfLink: 'selfLink',
  storageClass: 'storageClass',
  timeStorageClassUpdated: 'timeStorageClassUpdated',
};
