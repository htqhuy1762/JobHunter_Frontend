import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary để catch errors trong React component tree
 * Đặc biệt hữu ích cho TanStack Query errors
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state để hiện fallback UI
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error details
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Có thể gửi lên error tracking service (Sentry, LogRocket, etc.)
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
        });
        // Reload page để reset state
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    padding: '20px'
                }}>
                    <Result
                        status="error"
                        title="Đã xảy ra lỗi"
                        subTitle={
                            <div>
                                <p>Xin lỗi, có lỗi xảy ra trong quá trình xử lý.</p>
                                {import.meta.env.DEV && this.state.error && (
                                    <details style={{
                                        marginTop: '20px',
                                        textAlign: 'left',
                                        background: '#f5f5f5',
                                        padding: '10px',
                                        borderRadius: '4px'
                                    }}>
                                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                                            Chi tiết lỗi (chỉ hiện trong development)
                                        </summary>
                                        <pre style={{
                                            marginTop: '10px',
                                            fontSize: '12px',
                                            overflow: 'auto'
                                        }}>
                                            {this.state.error.message}
                                            {'\n\n'}
                                            {this.state.error.stack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        }
                        extra={[
                            <Button type="primary" key="reload" onClick={this.handleReset}>
                                Về trang chủ
                            </Button>,
                            <Button key="refresh" onClick={() => window.location.reload()}>
                                Tải lại trang
                            </Button>,
                        ]}
                    />
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
