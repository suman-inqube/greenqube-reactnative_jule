import { StyleSheet, Text, View, FlatList, Dimensions, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { axiosGet } from '../utils/api'
import { ROUTES } from '../utils/Routes'
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const ListOfCoFarmer = ({
    dbname, lan_id, token, user_id, farmeruserID, plotId, isLoading, setIsLoading
}) => {
    const [coFarmerList, setCoFarmerList] = useState([])
    useEffect(() => {
        const onPageload = async () => {
            setIsLoading(true)
            try {
                const response = await axiosGet(ROUTES.GET.LIST_CO_FARMERS({ land_fid: "2bacabeb-6448-48fb-8eb4-fc6a24ceb2d0" }), "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImY4MjU4YjE3LTJkYjQtNGZlYy1hZTYzLWNlYjE0MmExZWZjOCIsImlhdCI6MTYxMTI5NTU4NywiZXhwIjoxNjExOTAwMzg3fQ.NI85dnIUDSxzuon-E-C8sd2nZlQzW99dthuTSDNMPuo", {
                    information: "paddy_carbon_pr_53158,1,01e61545-72af-4b56-bfb9-74b605049d17"
                    // `${dbname},${lan_id},${farmeruserID}`,
                });
                if (response?.status == 200) {
                    setCoFarmerList(response?.data?.data?.rows)
                }
            } catch (error) {
                setIsLoading(false)
                console.error(error)
            } finally {
                setIsLoading(false)
            }
            setIsLoading(false)
        }
        onPageload();

    }, [])
    return (
        isLoading ? (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#2ecc71" />
            </View>
        ) : (
            <FlatList
                data={coFarmerList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => {
                    const isLast = index === coFarmerList.length - 1;

                    return (
                        <View style={[
                            styles.card,
                            !isLast && styles.cardBorder   // apply border except last
                        ]}>
                            <View style={styles.leftBorder} />
                            <View style={styles.content}>
                                <Text style={styles.name}>{item?.coFInfo?.userName}</Text>
                                <Text style={styles.details}>{item?.coFInfo?.contactNumber}</Text>
                            </View>
                        </View>
                    );
                }}

                ListEmptyComponent={
                    <Text style={styles.emptyText}>No Co-Farmers added yet</Text>
                }
                showsVerticalScrollIndicator={false}
            />
        )

    )
}
const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        // marginVertical: 6,
        // marginHorizontal: 10,
        shadowColor: '#000',
        // shadowOpacity: 0.1,
        // shadowOffset: { width: 0, height: 1 },
        // shadowRadius: 2,
        // elevation: 2
    },
    leftBorder: {
        // width: 6,
        // backgroundColor: '#2ecc71', // eye-catching green
        // borderTopLeftRadius: 12,
        // borderBottomLeftRadius: 12,
    },
    content: {
        flex: 1,
        padding: 10,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    details: {
        fontSize: 14,
        color: '#777',
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#999',
    },
    cardBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20
    }


});

export default ListOfCoFarmer
