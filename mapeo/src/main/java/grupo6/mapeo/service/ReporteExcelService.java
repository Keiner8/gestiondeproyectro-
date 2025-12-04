package grupo6.mapeo.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ReporteExcelService {
    
    public byte[] generarExcel(String titulo, String[] encabezados, List<String[]> datos) throws IOException {
        
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Reporte");
            
            // Crear estilo para encabezados
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.TEAL.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            
            // Crear estilo para datos (filas alternas)
            CellStyle dataStyle1 = workbook.createCellStyle();
            dataStyle1.setAlignment(HorizontalAlignment.CENTER);
            dataStyle1.setVerticalAlignment(VerticalAlignment.CENTER);
            dataStyle1.setFillForegroundColor(IndexedColors.WHITE.getIndex());
            dataStyle1.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            CellStyle dataStyle2 = workbook.createCellStyle();
            dataStyle2.setAlignment(HorizontalAlignment.CENTER);
            dataStyle2.setVerticalAlignment(VerticalAlignment.CENTER);
            dataStyle2.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            dataStyle2.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            // Crear encabezados
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < encabezados.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(encabezados[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Crear datos
            for (int i = 0; i < datos.size(); i++) {
                Row row = sheet.createRow(i + 1);
                String[] fila = datos.get(i);
                
                CellStyle rowStyle = (i % 2 == 0) ? dataStyle1 : dataStyle2;
                
                for (int j = 0; j < fila.length; j++) {
                    Cell cell = row.createCell(j);
                    cell.setCellValue(fila[j] != null ? fila[j] : "");
                    cell.setCellStyle(rowStyle);
                }
            }
            
            // Ajustar ancho de columnas
            for (int i = 0; i < encabezados.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            // Escribir a ByteArrayOutputStream
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        }
    }
}
