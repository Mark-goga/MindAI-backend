import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import ExcelJS from 'exceljs';

export type FileResponse = {
  fileBuffer: Buffer | ExcelJS.Buffer;
  fileName: string;
  fileType?: 'txt' | 'excel';
  contentType?: string;
};

@Injectable()
export class FileResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: FileResponse) => {
        if (!data || !data.fileBuffer) {
          return data;
        }

        const response = context.switchToHttp().getResponse();
        const {
          fileBuffer,
          fileName,
          fileType,
          contentType: contentTypeFromData,
        } = data;

        let contentType = contentTypeFromData;
        if (!contentType) {
          contentType =
            fileType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'text/plain';
        }

        if (typeof response.header === 'function') {
          response.header('Content-Type', contentType);
          const encodedFileName = encodeURIComponent(fileName);
          response.header(
            'Content-Disposition',
            `attachment; filename*=UTF-8''${encodedFileName}`,
          );
          response.header(
            'Access-Control-Expose-Headers',
            'Content-Disposition',
          );
          response.send(fileBuffer);
        } else if (typeof response.setHeader === 'function') {
          response.setHeader('Content-Type', contentType);
          const encodedFileName = encodeURIComponent(fileName);
          response.setHeader(
            'Content-Disposition',
            `attachment; filename*=UTF-8''${encodedFileName}`,
          );
          response.send(fileBuffer);
        }

        return undefined;
      }),
    );
  }
}
