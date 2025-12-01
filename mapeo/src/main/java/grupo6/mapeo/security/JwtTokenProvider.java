package grupo6.mapeo.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {
     
     private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);
     
     @Value("${jwt.secret:esta-es-una-clave-secreta-muy-larga-y-segura-para-usar-con-hs512-algoritmo-de-jwt-que-requiere-minimo-64-caracteres-para-una-seguridad-optima-2024}")
     private String secretKey;
     
     @Value("${jwt.expiration:86400000}")
     private long expiration; // 24 horas por defecto
    
    public String generateToken(Integer usuarioId, String correo, String rol) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("usuarioId", usuarioId);
        claims.put("rol", rol);
        
        return createToken(claims, correo);
    }
    
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(Keys.hmacShaKeyFor(secretKey.getBytes()), SignatureAlgorithm.HS512)
                .compact();
    }
    
    public Integer getUserIdFromToken(String token) {
         return (Integer) Jwts.parser()
                 .verifyWith(Keys.hmacShaKeyFor(secretKey.getBytes()))
                 .build()
                 .parseSignedClaims(token)
                 .getPayload()
                 .get("usuarioId");
     }
     
     public String getRoleFromToken(String token) {
         return (String) Jwts.parser()
                 .verifyWith(Keys.hmacShaKeyFor(secretKey.getBytes()))
                 .build()
                 .parseSignedClaims(token)
                 .getPayload()
                 .get("rol");
     }
     
     public String getUsernameFromToken(String token) {
         return Jwts.parser()
                 .verifyWith(Keys.hmacShaKeyFor(secretKey.getBytes()))
                 .build()
                 .parseSignedClaims(token)
                 .getPayload()
                 .getSubject();
     }
     
     public boolean validateToken(String token) {
         try {
             Jwts.parser()
                     .verifyWith(Keys.hmacShaKeyFor(secretKey.getBytes()))
                     .build()
                     .parseSignedClaims(token);
             return true;
        } catch (SecurityException e) {
            logger.error("JWT signature validation failed: {}", e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
            return false;
        } catch (ExpiredJwtException e) {
            logger.error("Expired JWT token: {}", e.getMessage());
            return false;
        } catch (UnsupportedJwtException e) {
            logger.error("Unsupported JWT token: {}", e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
            return false;
        }
    }
    
    public boolean isTokenExpired(String token) {
         try {
             Claims claims = Jwts.parser()
                     .verifyWith(Keys.hmacShaKeyFor(secretKey.getBytes()))
                     .build()
                     .parseSignedClaims(token)
                     .getPayload();
             return claims.getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        } catch (Exception e) {
            logger.error("Error checking token expiration: {}", e.getMessage());
            return true;
        }
    }
}
