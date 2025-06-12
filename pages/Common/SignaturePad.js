import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    Pressable,
    Image,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import RNFS from 'react-native-fs';

const SignaturePad = ({ setSignatureVal, signatureVal, statuslevel }) => {
    // statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED'
    const signatureRef = useRef();
    const [signature, setSignature] = useState(null); // File path
    const [signatureBase64, setSignatureBase64] = useState(null); // Raw base64
    const [showModal, setShowModal] = useState(false);
    const [signatureKey, setSignatureKey] = useState(0);
    const [hasDrawn, setHasDrawn] = useState(false);

    const saveBase64ToPNG = async (base64Image) => {
        try {
            const fileName = `signature_${Date.now()}.png`;
            const path = `${RNFS.CachesDirectoryPath}/${fileName}`;
            const base64Data = base64Image.replace(/^data:image\/png;base64,/, '');
            await RNFS.writeFile(path, base64Data, 'base64');
            return `file://${path}`;
        } catch (error) {
            console.error('Error saving base64 image:', error);
            return null;
        }
    };

    const handleOK = async (sig) => {
        if (!hasDrawn) {
            setSignature(null);
            setSignatureBase64(null);
            setShowModal(false);
            return;
        }
        if (statuslevel == 'CARBON_DOCUMENTS_SUBMITTED' || statuslevel == "CARBON_DOCUMENTS_APPROVED" ) return
        // Alert.alert("You cannot change the signature after submitting the documents");
        const base64Image = sig?.startsWith('data:image') ? sig : `data:image/png;base64,${sig}`;
        const imagePath = await saveBase64ToPNG(base64Image);
        if (imagePath) {
            setSignature(imagePath);
            setSignatureBase64(base64Image);
            setSignatureVal({ uri: imagePath, name: `signature_${Date.now()}.png`, type: 'image/png', fileName: `signature_${Date.now()}.png`, id: '' });
        }

        setShowModal(false);
    };

    const handleClear = () => {
        if (statuslevel == 'CARBON_DOCUMENTS_SUBMITTED' || statuslevel == "CARBON_DOCUMENTS_APPROVED") return
        signatureRef.current.clearSignature();
        setSignature(null);
        setSignatureBase64(null);
        setSignatureVal({ uri: "", name: "", type: "", fileName: "", id: "" });
        setSignatureKey(prevKey => prevKey + 1);
        setHasDrawn(false);
    };

    const handleConfirm = () => {
        signatureRef.current.readSignature();
    };

    const handleBegin = () => {
        setHasDrawn(true);
    };
    const convertApiUrlToBase64 = async (url) => {
        try {
            if (url == null || url == undefined || url == "") return null;
            const fileName = url?.split('/').pop();
            const localPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
            const download = await RNFS.downloadFile({
                fromUrl: url,
                toFile: localPath,
            }).promise;

            if (download.statusCode === 200) {
                // Step 3: Convert to base64
                const base64 = await RNFS.readFile(localPath, 'base64');
                const extension = fileName.endsWith('.png')
                    ? 'png'
                    : fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')
                        ? 'jpeg'
                        : 'png'; // fallback

                return `data:image/${extension};base64,${base64}`;
            } else {
                throw new Error(`Download failed with status ${download.statusCode}`);
            }
        } catch (error) {
            console.error('Failed to convert URL to base64:', error);
            return null;
        }
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (signatureVal?.uri == "") return;
                if (signatureVal?.uri?.startsWith("file://")) return
                const data = await convertApiUrlToBase64(signatureVal?.uri)
                if (data != null) {
                    setSignatureBase64(data)
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            }
        };
        fetchData();
    }, [signatureVal]);
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Digital Signature</Text>
        <Pressable onPress={() => setShowModal(true)} style={styles.previewBox}>
          {signatureVal?.uri ? (
            <Image
              source={{uri: signatureVal?.uri}}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.placeholderText}>Tap to sign</Text>
          )}
        </Pressable>

        <Modal
          visible={showModal}
          animationType="slide"
          onRequestClose={() => setShowModal(false)}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.signatureContainer}>
              <SignatureScreen
                backgroundColor="rgb(255, 255, 255)"
                ref={signatureRef}
                key={signatureKey}
                onOK={handleOK}
                imageType={'image/png'}
                onBegin={handleBegin}
                dataURL={signatureBase64}
                autoClear={false}
                webStyle={`
                                .m-signature-pad {
                                    border: none;
                                    box-shadow: none;
                                }
                                .m-signature-pad--footer {
                                    display: none;
                                }
                                body,html {
                                    margin: 0;
                                    height: 100%;
                                }
                                canvas {
                                    background-color: #fff;
                                }
                               
                            `}
              />
            </View>

            {statuslevel == 'CARBON_DOCUMENTS_REJECTED' ||
            statuslevel == 'APPROVED' ? (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClear}>
                  <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirm}>
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <></>
            )}
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
};

export default SignaturePad;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
        marginBottom: 12,
    },
    title: {
        marginHorizontal: 5,
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        marginVertical: 7,
    },
    previewBox: {
        height: 150,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        elevation: 1,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    placeholderText: {
        color: '#888',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    signatureContainer: {
        flex: 1,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        borderTopWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f8f8f8',
    },
    clearButton: {
        padding: 12,
        backgroundColor: '#d9534f',
        borderRadius: 6,
        minWidth: 100,
        alignItems: 'center',
    },
    confirmButton: {
        padding: 12,
        backgroundColor: '#003c04',
        borderRadius: 6,
        minWidth: 100,
        alignItems: 'center',
    },
    buttonText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold',
    },
});
