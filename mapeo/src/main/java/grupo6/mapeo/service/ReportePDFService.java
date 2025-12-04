package grupo6.mapeo.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportePDFService {
    
    @Autowired
    private ResourceLoader resourceLoader;
    
    public byte[] generarPDF(String titulo, String[] encabezados, List<String[]> datos) 
            throws DocumentException, IOException {
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate());
        PdfWriter.getInstance(document, baos);
        document.open();
        
        // Agregar logo
        try {
            InputStream logoStream = resourceLoader.getResource("classpath:static/img/logo2.png").getInputStream();
            Image logo = Image.getInstance(readInputStream(logoStream));
            logo.scaleToFit(100, 100);
            logo.setAlignment(Element.ALIGN_CENTER);
            document.add(logo);
        } catch (Exception e) {
            System.out.println("Logo no encontrado, continuando sin logo: " + e.getMessage());
        }
        
        // Espaciador
        document.add(new Paragraph(" "));
        
        // Título principal
        Font fontTitulo = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
        Paragraph parrafoTitulo = new Paragraph(titulo.toUpperCase(), fontTitulo);
        parrafoTitulo.setAlignment(Element.ALIGN_CENTER);
        parrafoTitulo.setSpacingAfter(5);
        document.add(parrafoTitulo);
        
        // Subtítulo
        Font fontSubtitulo = new Font(Font.FontFamily.HELVETICA, 10, Font.ITALIC);
        Paragraph parrafoSubtitulo = new Paragraph(getSubtitulo(titulo), fontSubtitulo);
        parrafoSubtitulo.setAlignment(Element.ALIGN_CENTER);
        parrafoSubtitulo.setSpacingAfter(20);
        document.add(parrafoSubtitulo);
        
        // Fecha de generación
        LocalDateTime ahora = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String fecha = ahora.format(formatter);
        
        Font fontFecha = new Font(Font.FontFamily.HELVETICA, 9);
        Paragraph parrafoFecha = new Paragraph("Fecha de generación: " + fecha, fontFecha);
        parrafoFecha.setSpacingAfter(20);
        document.add(parrafoFecha);
        
        // Línea separadora
        document.add(new Paragraph("_".repeat(100)));
        document.add(new Paragraph(" "));
        
        // Tabla
        PdfPTable tabla = new PdfPTable(encabezados.length);
        tabla.setWidthPercentage(100);
        tabla.setSpacingBefore(10);
        
        // Encabezados con color teal
        Font fontEncabezado = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, BaseColor.WHITE);
        for (String encabezado : encabezados) {
            PdfPCell celda = new PdfPCell(new Phrase(encabezado, fontEncabezado));
            celda.setBackgroundColor(new BaseColor(31, 117, 133)); // Color teal/azul oscuro
            celda.setPadding(12);
            celda.setHorizontalAlignment(Element.ALIGN_CENTER);
            celda.setVerticalAlignment(Element.ALIGN_MIDDLE);
            celda.setBorder(PdfPCell.BOX);
            celda.setBorderColor(BaseColor.BLACK);
            tabla.addCell(celda);
        }
        
        // Datos
        Font fontDatos = new Font(Font.FontFamily.HELVETICA, 9);
        for (int i = 0; i < datos.size(); i++) {
            String[] fila = datos.get(i);
            for (String valor : fila) {
                PdfPCell celda = new PdfPCell(new Phrase(valor != null ? valor : "", fontDatos));
                celda.setPadding(10);
                celda.setHorizontalAlignment(Element.ALIGN_CENTER);
                celda.setVerticalAlignment(Element.ALIGN_MIDDLE);
                
                // Alternar colores de filas
                if (i % 2 == 0) {
                    celda.setBackgroundColor(new BaseColor(240, 240, 240));
                } else {
                    celda.setBackgroundColor(BaseColor.WHITE);
                }
                
                celda.setBorder(PdfPCell.BOX);
                celda.setBorderColor(new BaseColor(200, 200, 200));
                tabla.addCell(celda);
            }
        }
        
        document.add(tabla);
        
        document.close();
        
        return baos.toByteArray();
    }
    
    /**
     * Retorna el subtítulo basado en el título del reporte
     */
    private String getSubtitulo(String titulo) {
        if (titulo.toLowerCase().contains("usuario")) {
            return "Registro de usuarios del sistema";
        } else if (titulo.toLowerCase().contains("ficha")) {
            return "Registro de fichas y aprendices";
        } else if (titulo.toLowerCase().contains("instructor")) {
            return "Registro de instructores y especialidades";
        } else if (titulo.toLowerCase().contains("trimestre")) {
            return "Registro de trimestres por ficha";
        } else if (titulo.toLowerCase().contains("proyecto")) {
            return "Registro de proyectos por GAES";
        } else {
            return "Reporte del sistema";
        }
    }
    
    /**
     * Convierte un InputStream a byte[]
     */
    private byte[] readInputStream(InputStream inputStream) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int bytesRead;
        while ((bytesRead = inputStream.read(buffer)) != -1) {
            baos.write(buffer, 0, bytesRead);
        }
        inputStream.close();
        return baos.toByteArray();
    }
}
