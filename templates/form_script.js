document.addEventListener('DOMContentLoaded', function() {
    // --- DOMContentLoaded ---

    const environmentOptionsContainer = document.getElementById('environment-options');
    const environmentInput = document.getElementById('environment');
    const currentEnvironmentSelection = document.getElementById('currentEnvironmentSelection');
    const environmentSelectDiv = document.querySelector('.environment-select');

    const protocolOptionsContainer = document.getElementById('protocol-options');
    const protocolInput = document.getElementById('protocol');
    const currentProtocolSelection = document.getElementById('currentProtocolSelection');
    const protocolSelectDiv = document.querySelector('.protocol-select');

    const nameServiceInput = document.getElementById('nameService');
    const nodeIpInput = document.getElementById('nodeIp');
    const typeServiceRadio = document.getElementById('typeService');
    const typeInfraRadio = document.getElementById('typeInfra');
    const submitButton = document.getElementById('submitButton');

    let selectedEnvironments = [];
    let selectedProtocol = 'protocol';

    currentEnvironmentSelection.addEventListener('click', function() {
        environmentOptionsContainer.classList.toggle('show');
    });

    currentProtocolSelection.addEventListener('click', function() {
        protocolOptionsContainer.classList.toggle('show');
    });

    environmentOptionsContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('environment-option-item')) {
            const value = event.target.dataset.value;
            if (selectedEnvironments.includes(value)) {
                selectedEnvironments = selectedEnvironments.filter(env => env !== value);
                event.target.classList.remove('selected');
            } else {
                selectedEnvironments.push(value);
                event.target.classList.add('selected');
            }
            environmentInput.value = selectedEnvironments.join(',');
            updateCurrentEnvironmentSelectionText();
        }
    });

    protocolOptionsContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('protocol-option-item')) {
            const value = event.target.dataset.value;
            selectedProtocol = value;
            protocolInput.value = selectedProtocol;
            updateCurrentProtocolSelectionText();
            protocolOptionsContainer.classList.remove('show');
        }
    });

    function updateCurrentEnvironmentSelectionText() {
        if (selectedEnvironments.length > 0) {
            currentEnvironmentSelection.textContent = selectedEnvironments.join(', ');
        } else {
            currentEnvironmentSelection.textContent = 'Chọn môi trường';
        }
    }

    function updateCurrentProtocolSelectionText() {
        currentProtocolSelection.textContent = selectedProtocol;
    }

    // Function to generate a random password
    function generateRandomPassword(length) {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Alphanumeric only
        let password = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            password += charset.charAt(Math.floor(Math.random() * n));
        }
        return password;
    }

    // Function escape MarkdownV2
    function escapeMarkdownV2(text) {
        return text;
    }


    function createTelegramMessage(formData, stagingPassword, productPassword, labelsText, stagingEndpointURL, productEndpointURL) {
        const escapedStagingPassword = escapeMarkdownV2(stagingPassword);
        const escapedProductPassword = escapeMarkdownV2(productPassword);
        const escapedNodeIp = escapeMarkdownV2(formData.nodeIp);
        const escapedLabels = escapeMarkdownV2(labelsText);
        const escapedStagingEndpointURL = escapeMarkdownV2(stagingEndpointURL);
        const escapedProductEndpointURL = escapeMarkdownV2(productEndpointURL);

        return `🔔THÔNG TIN ĐĂNG KÝ ENDPOINT METRICS

🐦INFORMATION - VICTORIA METRICS STAGING CLUSTER
- Name Service: ${formData.nameService}
- Username: ${formData.nameService}
- Password: ${escapedStagingPassword}
- Type metrics: ${formData.typeMetrics}
- Environment: ${formData.environment}
- Protocol: ${formData.protocol}
- Endpoint: ${escapedStagingEndpointURL}
- Node IP: ${escapedNodeIp}
- Labels: ${escapedLabels}

🐦INFORMATION VICTORIA METRICS PRODUCT CLUSTER
- Name Service: ${formData.nameService}
- Username: ${formData.nameService}
- Password: ${escapedProductPassword}
- Type metrics: ${formData.typeMetrics}
- Environment: ${formData.environment}
- Protocol: ${formData.protocol}
- Endpoint: ${escapedProductEndpointURL}
- Node IP: ${escapedNodeIp}
- Labels: ${escapedLabels}`;
    }


    document.getElementById('metricsForm').addEventListener('submit', function(event) {
        event.preventDefault();
        let nameService = document.getElementById('nameService').value.trim(); // Trim whitespace - LET, not CONST
        const typeMetrics = document.querySelector('input[name="typeMetrics"]:checked');
        const environment = document.getElementById('environment').value;
        const protocol = document.getElementById('protocol').value;
        const nodeIp = document.getElementById('nodeIp').value; // Get node IP value

        let isValid = true;


        // Condition check enter infomation
        if (!nameService) {
            isValid = false;
        }

        if (!typeMetrics) {
            isValid = false;
        }

        if (!environment) {
            isValid = false;
        }

        if (protocol === 'protocol') {
            isValid = false;
        }

        if (!nodeIp) {
            isValid = false;
        } else if (!validateIPs(nodeIp)) {
            isValid = false;
        }


        if (!isValid) {
            alert('Vui lòng nhập đủ thông tin.');
            return;
        }


        if (isValid) {
            const formData = {
                nameService: nameService,
                typeMetrics: typeMetrics.value,
                environment: environment,
                protocol: protocol,
                nodeIp: nodeIp
            };

            // Đổi text nút Export thành "Đang xử lý..." ngay khi submit
            submitButton.textContent = 'Đang xử lý...';

            // Generate random passwords
            const stagingRandomPassword = generateRandomPassword(32);
            const productRandomPassword = generateRandomPassword(32);

            // --- Set thông tin Labels ---
            const nameLabelValue = formData.nameService.replace(/-/g, '_') + '_$1';
            const monitorLabelValue = formData.nameService;
            let labelsText = `__name__="${nameLabelValue}", monitor="${monitorLabelValue}"`;

            // Thêm project_id và region labels nếu Type metrics là "infra"
            if (formData.typeMetrics === 'infra') {
                labelsText += `, project_id="(^[a-z0-9]{32}$)", region="(.+)"`;
            }

            let stagingEndpointURL = '';
            let productEndpointURL = '';

            switch (formData.protocol) {
                case 'prometheus-remote-write':
                    stagingEndpointURL = 'http://127.0.0.1/api/v1/write';
                    productEndpointURL = 'http://127.0.0.1/api/v1/write';
                    break;
                case 'influx-line':
                    stagingEndpointURL = 'http://127.0.0.1/write';
                    productEndpointURL = 'http://127.0.0.1/write';
                    break;
                case 'json-lines-import':
                    stagingEndpointURL = 'http://127.0.0.1/api/v1/import';
                    productEndpointURL = 'http://127.0.0.1/api/v1/import';
                    break;
                case 'native-data-import':
                    stagingEndpointURL = 'http://127.0.0.1/api/v1/import/native';
                    productEndpointURL = 'http://127.0.0.1/api/v1/import/native';
                    break;
                case 'arbitrary-csv-data':
                    stagingEndpointURL = 'http://127.0.0.1/api/v1/import/csv';
                    productEndpointURL = 'http://127.0.0.1/api/v1/import/csv';
                    break;
                case 'prometheus-exposition-format':
                    stagingEndpointURL = 'http://127.0.0.1/api/v1/import/prometheus';
                    productEndpointURL = 'http://127.0.0.1/api/v1/import/prometheus';
                    break;
                case 'graphite-plaintext':
                    stagingEndpointURL = 'http://127.0.0.1:20041';
                    productEndpointURL = 'http://127.0.0.1:20041';
                    break;
                case 'opentsdb':
                    stagingEndpointURL = 'http://127.0.0.1:30041';
                    productEndpointURL = 'http://127.0.0.1:30041';
                    break;
                default:
                    stagingEndpointURL = 'Endpoint URL not defined';
                    productEndpointURL = 'Endpoint URL not defined';
            }


            const telegramToken = '';
            const telegramChatId = '';
            const telegramMessageThreadId = '';
            const telegramMessage = createTelegramMessage(formData, stagingRandomPassword, productRandomPassword, labelsText, stagingEndpointURL, productEndpointURL);
            const telegramApiUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

            fetch(telegramApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: telegramChatId,
                    text: telegramMessage,
                    message_thread_id: telegramMessageThreadId
                })
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('registrationForm').style.display = 'none';
                document.getElementById('resultForm').style.display = 'block';

                // Điền dữ liệu vào form kết quả (Staging Cluster)
                document.getElementById('staging-nameService').textContent = formData.nameService;
                document.getElementById('staging-username').textContent = formData.nameService;
                document.getElementById('staging-password').textContent = stagingRandomPassword;
                document.getElementById('staging-typeMetrics').textContent = formData.typeMetrics;
                document.getElementById('staging-environment').textContent = formData.environment;
                document.getElementById('staging-protocol').textContent = formData.protocol;
                document.getElementById('staging-nodeIp').textContent = formData.nodeIp;
                document.getElementById('staging-labels').textContent = labelsText;
                document.getElementById('staging-endpoint').textContent = stagingEndpointURL;

                // Điền dữ liệu vào form kết quả (Product Cluster)
                document.getElementById('product-nameService').textContent = formData.nameService;
                document.getElementById('product-username').textContent = formData.nameService;
                document.getElementById('product-password').textContent = productRandomPassword;
                document.getElementById('product-typeMetrics').textContent = formData.typeMetrics;
                document.getElementById('product-environment').textContent = formData.environment;
                document.getElementById('product-protocol').textContent = formData.protocol;
                document.getElementById('product-nodeIp').textContent = formData.nodeIp;
                document.getElementById('product-labels').textContent = labelsText;
                document.getElementById('product-endpoint').textContent = productEndpointURL;


                if (data.ok) {
                    alert('ĐĂNG KÝ THÀNH  CÔNG, HỆ THỐNG ĐANG TIẾP NHẬN ĐỂ XỬ LÝ. VUI LÒNG KHÔNG CHIA SẺ THÔNG TIN DƯỚI DÂY CHO BẤT KỲ AI. XIN CẢM ƠN!!!');

                    setTimeout(function() {
                        alert('ĐÂY LÀ PHIẾU ĐĂNG KÝ CỦA BẠN. CHÚNG TÔI SẼ PHẢN HỒI LẠI CHO BẠN SỚM THÔI!!!');
                        submitButton.textContent = 'Export';
                    }, 1000);

                } else {
                    alert('Export thành công, nhưng có lỗi khi gửi Telegram. Vui lòng kiểm tra Console để biết thêm chi tiết.');
                    submitButton.textContent = 'Export';
                }
            })
            .catch(error => {
                console.error('Error sending Telegram message:', error);
                alert('Export thành công, nhưng có lỗi khi gửi Telegram. Vui lòng kiểm tra Console để biết thêm chi tiết.');
                submitButton.textContent = 'Export';
            });
        }
    });

    function validateIPs(ipString) {
        const ipError = document.getElementById('ip-error');
        ipError.textContent = '';
        if (!ipString) return true;

        const ips = ipString.split(',').map(ip => ip.trim());
        for (const ip of ips) {
            if (!isValidIPAddress(ip)) {
                ipError.textContent = 'Invalid IP format. Please use format like 192.168.1.1, 10.0.0.5';
                return false;
            }
        }
        return true;
    }

    function isValidIPAddress(ip) {
        if (!ip) return true;
        return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
    }

    nodeIpInput.addEventListener('blur', function() {
        validateIPs(nodeIpInput.value);
    });

    // Close environment dropdown when clicking outside
    window.addEventListener('click', function(event) {
        if (!environmentSelectDiv.contains(event.target)) {
            environmentOptionsContainer.classList.remove('show');
        }
        if (!protocolSelectDiv.contains(event.target)) {
            protocolOptionsContainer.classList.remove('show');
        }
    });

    nameServiceInput.addEventListener('input', function() {
        let value = nameServiceInput.value;
        value = removeDiacritics(value).toLowerCase().replace(/\s+/g, '-');
        nameServiceInput.value = value;
    });

    function removeDiacritics(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // --- DOMContentLoaded ---
});
