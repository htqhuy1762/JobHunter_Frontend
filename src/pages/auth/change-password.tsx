import { Button, Divider, Form, Input, message, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { callChangePassword } from 'config/api';
import { useState } from 'react';
import styles from 'styles/auth.module.scss';
import { LockOutlined } from '@ant-design/icons';

const ChangePasswordPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        const { oldPassword, newPassword, confirmPassword } = values;
        setIsSubmit(true);
        const res = await callChangePassword(oldPassword, newPassword, confirmPassword);
        setIsSubmit(false);

        if (res && res.statusCode === 200) {
            message.success('Đổi mật khẩu thành công!');
            form.resetFields();
            // Có thể redirect về trang profile hoặc dashboard
            navigate('/');
        } else {
            notification.error({
                message: "Có lỗi xảy ra",
                description:
                    res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 5
            })
        }
    };

    return (
        <div className={styles["login-page"]}>
            <main className={styles.main}>
                <div className={styles.container}>
                    <section className={styles.wrapper}>
                        <div className={styles.heading}>
                            <h2 className={`${styles.text} ${styles["text-large"]}`}>Đổi Mật Khẩu</h2>
                            <Divider />
                        </div>
                        <Form
                            form={form}
                            name="change-password"
                            onFinish={onFinish}
                            autoComplete="off"
                            layout="vertical"
                        >
                            <Form.Item
                                label="Mật khẩu cũ"
                                name="oldPassword"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu cũ!' }
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Nhập mật khẩu cũ"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Mật khẩu mới"
                                name="newPassword"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Nhập mật khẩu mới"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Xác nhận mật khẩu mới"
                                name="confirmPassword"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Xác nhận mật khẩu mới"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSubmit}
                                    style={{ width: '100%' }}
                                >
                                    Đổi mật khẩu
                                </Button>
                            </Form.Item>

                            <Divider />

                            <div style={{ textAlign: 'center' }}>
                                <Button
                                    type="link"
                                    onClick={() => navigate('/')}
                                >
                                    Quay lại trang chủ
                                </Button>
                            </div>
                        </Form>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ChangePasswordPage;
