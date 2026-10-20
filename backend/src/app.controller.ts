import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Controller('test-log')
export class AppController {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(AppController.name);
  }

  // 1. Log thành công bình thường
  @Get()
  handleTest() {
    this.logger.info({ action: 'TEST_SUCCESS' }, 'Xử lý request bình thường');
    return { status: 'ok' };
  }

  // Đây là lỗi kinh điển nhất khi code: truy cập thuộc tính của object rỗng
  @Get('crash')
  simulateCrash() {
    this.logger.info({ action: 'CHECK_USER' }, 'Đang tìm thông tin user...');
    const user: any = null;
    return user.profile.avatar; // Gây crash: TypeError: Cannot read properties of null
  }

  @Get('payment-timeout')
  simulatePaymentError() {
    this.logger.warn(
      { gateway: 'VNPay', action: 'CONNECT_GATEWAY' },
      'Đang gửi yêu cầu thanh toán sang VNPay...',
    );

    this.logger.error(
      {
        gateway: 'VNPay',
        orderId: 'ORDER_9999',
        errorCode: 'GATEWAY_TIMEOUT',
      },
      'Kết nối đến cổng thanh toán VNPay thất bại sau 5000ms!',
    );

    throw new InternalServerErrorException(
      'Không thể kết nối đến cổng thanh toán',
    );
  }

  // 💥 Kịch bản 3: Luồng nghiệp vụ nhiều bước (Một chuỗi log cùng 1 Request ID)
  @Get('order-flow')
  simulateOrderFlow() {
    // Bước 1: Nhận đơn
    this.logger.info(
      { step: 1, action: 'ORDER_RECEIVED' },
      'Bước 1: Tiếp nhận đơn hàng #123456',
    );

    // Bước 2: Trừ tồn kho
    this.logger.info(
      { step: 2, action: 'INVENTORY_DEDUCTED', sku: 'IPHONE-16' },
      'Bước 2: Đã trừ kho thành công',
    );

    // Bước 3: Gặp sự cố trừ tiền
    this.logger.error(
      {
        step: 3,
        action: 'PAYMENT_FAILED',
        reason: 'INSUFFICIENT_FUNDS',
        userId: 'USER_888',
      },
      'Bước 3: Trừ tiền thất bại - Tài khoản người dùng không đủ số dư!',
    );

    throw new HttpException(
      { message: 'Thanh toán thất bại, số dư không đủ', code: 'PAYMENT_FAIL' },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}