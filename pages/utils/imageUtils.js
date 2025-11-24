import ImageResizer from '@bam.tech/react-native-image-resizer';

// /**
//  * Resize any image using @bam.tech/react-native-image-resizer
//  * @param {string} uri - Original image URI
//  * @param {number} width - Target width
//  * @param {number} height - Target height
//  * @param {number} quality - JPEG quality (0–100)
//  * @returns {Promise<string>} - Resized image URI
//  */
export const resizeImage = async (
  uri,
  width = 1200,
  height = 1600,
  quality = 85
) => {
  try {
    const result = await ImageResizer.createResizedImage(
      uri,
      width,
      height,
      'JPEG',
      quality,
      0,     
      undefined,
      false   
    );

    return result.uri;
  } catch (error) {
    console.error('Image resize failed:', error);
    return uri;
  }
};
