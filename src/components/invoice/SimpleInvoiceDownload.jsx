import {
    Document,
    Font,
    Page,
    StyleSheet,
    Text,
    View
} from "@react-pdf/renderer";

// Register fonts for the PDF document
Font.register({
    family: "Roboto",
    fonts: [
        { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf", fontWeight: 300 },
        { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf", fontWeight: 400 },
        { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf", fontWeight: 500 },
        { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: 700 }
    ]
});

// Define styles for the invoice
const styles = StyleSheet.create({
    page: {
        fontFamily: "Roboto",
        fontSize: 10,
        padding: 30,
        backgroundColor: "#FFFFFF",
        color: "#333333",
    },
    header: {
        borderBottom: "1 solid #EEEEEE",
        paddingBottom: 10,
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    companyDetails: {
        maxWidth: "50%",
    },
    companyName: {
        fontSize: 16,
        fontWeight: 700,
        marginBottom: 4,
    },
    companyInfo: {
        fontSize: 9,
        color: "#555555",
        lineHeight: 1.5,
    },
    invoiceDetails: {
        textAlign: "right",
    },
    invoiceTitle: {
        fontSize: 14,
        fontWeight: 700,
        marginBottom: 8,
    },
    invoiceData: {
        fontSize: 9,
        color: "#555555",
        lineHeight: 1.5,
    },
    invoiceId: {
        color: "#000000",
        fontWeight: 500,
    },
    clientSection: {
        marginBottom: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 500,
        marginBottom: 6,
        color: "#555555",
    },
    clientInfo: {
        fontSize: 9,
        lineHeight: 1.5,
    },
    table: {
        marginTop: 20,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: "row",
        borderBottom: "1 solid #EEEEEE",
        paddingBottom: 6,
        backgroundColor: "#F9F9F9",
        fontWeight: 500,
        fontSize: 9,
    },
    tableRow: {
        flexDirection: "row",
        borderBottom: "1 solid #EEEEEE",
        paddingVertical: 8,
        fontSize: 9,
    },
    tableCol1: {
        width: "5%",
    },
    tableCol2: {
        width: "45%",
    },
    tableCol3: {
        width: "10%",
        textAlign: "center",
    },
    tableCol4: {
        width: "20%",
        textAlign: "right",
    },
    tableCol5: {
        width: "20%",
        textAlign: "right",
    },
    summarySection: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    summaryTable: {
        width: "40%",
    },
    summaryRow: {
        flexDirection: "row",
        paddingVertical: 4,
        justifyContent: "space-between",
    },
    summaryKey: {
        fontSize: 9,
        fontWeight: 400,
    },
    summaryValue: {
        fontSize: 9,
        fontWeight: 500,
        textAlign: "right",
    },
    totalRow: {
        flexDirection: "row",
        paddingVertical: 6,
        justifyContent: "space-between",
        borderTop: "1 solid #EEEEEE",
        marginTop: 4,
    },
    totalKey: {
        fontSize: 10,
        fontWeight: 700,
    },
    totalValue: {
        fontSize: 10,
        fontWeight: 700,
        textAlign: "right",
        color: "#000000",
    },
    footer: {
        marginTop: 30,
        borderTop: "1 solid #EEEEEE",
        paddingTop: 10,
        fontSize: 8,
        color: "#666666",
        textAlign: "center",
    },
    paymentInfo: {
        marginTop: 20,
        fontSize: 9,
        padding: 10,
        backgroundColor: "#F9F9F9",
        borderRadius: 4,
        lineHeight: 1.5,
    },
    paymentTitle: {
        fontWeight: 500,
        marginBottom: 5,
    },
    notesSection: {
        marginTop: 30,
    },
    notesTitle: {
        fontSize: 9,
        fontWeight: 500,
        marginBottom: 5,
    },
    notes: {
        fontSize: 8,
        color: "#555555",
        lineHeight: 1.5,
    }
});

// Company information (hardcoded as requested)
const COMPANY_INFO = {
    name: "COOLMAN STORE",
    address: "1 Võ Văn Ngân, P. Hiệp Bình Phước, Q. Thủ Đức, TP.HCM",
    phone: "0909 123 456",
    email: "coolmanstore@gmail.com",
    website: "www.coolmanstore.vn",
    taxId: "0301234567"
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'decimal',
        maximumFractionDigits: 0
    }).format(amount) + " đ";
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Main invoice component
const SimpleInvoiceDownload = ({ data }) => {
    const calculateItemTotal = (price, quantity) => {
        return price * quantity;
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <View style={styles.companyDetails}>
                            <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
                            <Text style={styles.companyInfo}>
                                {`Địa chỉ: ${COMPANY_INFO.address}\n`}
                                {`Điện thoại: ${COMPANY_INFO.phone}\n`}
                                {`Email: ${COMPANY_INFO.email}\n`}
                                {`Website: ${COMPANY_INFO.website}\n`}
                                {`Mã số thuế: ${COMPANY_INFO.taxId}`}
                            </Text>
                        </View>
                        <View style={styles.invoiceDetails}>
                            <Text style={styles.invoiceTitle}>HÓA ĐƠN BÁN HÀNG</Text>
                            <Text style={styles.invoiceData}>
                                {`Số hóa đơn: `}<Text style={styles.invoiceId}>{data.invoice}</Text>{`\n`}
                                {`Ngày đặt hàng: ${formatDate(data.createdAt)}\n`}
                                {`Ngày xuất hóa đơn: ${formatDate(new Date())}`}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Client and Order Information */}
                <View style={styles.clientSection}>
                    <View style={[styles.section, { flex: 1 }]}>
                        <Text style={styles.sectionTitle}>THÔNG TIN KHÁCH HÀNG</Text>
                        <Text style={styles.clientInfo}>
                            {`${data.user_info.name}\n`}
                            {`Điện thoại: ${data.user_info.contact}\n`}
                            {data.user_info.email ? `Email: ${data.user_info.email}\n` : ''}
                            {`Địa chỉ: ${data.user_info.address}\n`}
                            {data.user_info.city ? `${data.user_info.city}, ${data.user_info.country}` : data.user_info.country}
                        </Text>
                    </View>
                    <View style={[styles.section, { flex: 1, alignItems: 'flex-end' }]}>
                        <Text style={[styles.sectionTitle, { textAlign: 'right' }]}>PHƯƠNG THỨC THANH TOÁN</Text>
                        <Text style={[styles.clientInfo, { textAlign: 'right' }]}>
                            {data.paymentMethod || "Thanh toán khi nhận hàng (COD)"}
                        </Text>
                    </View>
                </View>

                {/* Products Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableCol1}>STT</Text>
                        <Text style={styles.tableCol2}>SẢN PHẨM</Text>
                        <Text style={styles.tableCol3}>SỐ LƯỢNG</Text>
                        <Text style={styles.tableCol4}>ĐƠN GIÁ</Text>
                        <Text style={styles.tableCol5}>THÀNH TIỀN</Text>
                    </View>

                    {data.items.map((item, index) => (
                        <View style={styles.tableRow} key={index}>
                            <Text style={styles.tableCol1}>{index + 1}</Text>
                            <Text style={styles.tableCol2}>
                                {item.itemName}
                                {(item.size || item.color) && (
                                    `\n${[
                                        item.size && `Size: ${item.size}`,
                                        item.color && `Màu: ${item.color}`
                                    ].filter(Boolean).join(', ')}`
                                )}
                            </Text>
                            <Text style={styles.tableCol3}>{item.quantity}</Text>
                            <Text style={styles.tableCol4}>{formatCurrency(item.price)}</Text>
                            <Text style={styles.tableCol5}>{formatCurrency(calculateItemTotal(item.price, item.quantity))}</Text>
                        </View>
                    ))}
                </View>

                {/* Summary Section */}
                <View style={styles.summarySection}>
                    <View style={styles.summaryTable}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryKey}>Tạm tính:</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(data.subTotal || 0)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryKey}>Phí vận chuyển:</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(data.shippingCost || 0)}</Text>
                        </View>
                        {data.discount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryKey}>Giảm giá:</Text>
                                <Text style={styles.summaryValue}>-{formatCurrency(data.discount)}</Text>
                            </View>
                        )}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalKey}>Tổng cộng:</Text>
                            <Text style={styles.totalValue}>{formatCurrency(data.total || 0)}</Text>
                        </View>
                    </View>
                </View>

                {/* Payment Information */}
                <View style={styles.paymentInfo}>
                    <Text style={styles.paymentTitle}>Chi tiết thanh toán:</Text>
                    <Text>
                        {`- Phương thức thanh toán: ${data.paymentMethod || "Thanh toán khi nhận hàng (COD)"}`}
                    </Text>
                </View>

                {/* Notes Section */}
                <View style={styles.notesSection}>
                    <Text style={styles.notesTitle}>Lưu ý:</Text>
                    <Text style={styles.notes}>
                        {`• Quý khách vui lòng kiểm tra hàng trước khi thanh toán và nhận hàng.\n`}
                        {`• Mọi thắc mắc về đơn hàng vui lòng liên hệ hotline: ${COMPANY_INFO.phone}.`}
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Cảm ơn quý khách đã mua hàng tại {COMPANY_INFO.name}</Text>
                </View>
            </Page>
        </Document>
    );
};

export default SimpleInvoiceDownload; 