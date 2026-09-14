/*
 * Copyright (c) 2018-2022, FusionAuth, All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 */
package io.fusionauth.plugin.spi.security;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Used to hash user passwords.
 *
 * @author Brian Pontarelli
 */
public interface PasswordEncryptor {
  /**
   * This pattern represents a standard MIME compatible Base64 encoding scheme.
   * <p>
   * This pattern can be used to validate most salts. This won't necessarily confirm the correct length of the salt.
   */
  Pattern Base64SaltPattern = Pattern.compile("^[A-Za-z0-9+/]+=*$");

  /**
   * @return The default factor for this PasswordEncryptor.
   */
  int defaultFactor();

  /**
   * Hashes the given password using the given salt.
   *
   * @param password The password to hash.
   * @param salt     The salt that can optionally be used to increase the security of the password hash. This is expected to be a
   *                 Base64 encoded byte array.
   * @param factor   The load or iteration factor for this hashing operation.
   * @return The hashed password in a Base64 encoded string.
   */
  String encrypt(String password, String salt, int factor);

  /**
   * Generates a random salt that is compatible with the PasswordEncryptor. The default implementation uses two UUIDs
   * and Base 64 encodes them.
   *
   * @return The salt.
   */
  default String generateSalt() {
    ByteBuffer buf = ByteBuffer.allocate(32);
    UUID first = UUID.randomUUID();
    buf.putLong(first.getLeastSignificantBits());
    buf.putLong(first.getMostSignificantBits());
    UUID second = UUID.randomUUID();
    buf.putLong(second.getLeastSignificantBits());
    buf.putLong(second.getMostSignificantBits());
    return Base64.getEncoder().encodeToString(buf.array());
  }

  /**
   * Optionally return a human-readable name that will be used to select this plugin in the UI.
   *
   * @return a display name, or null
   */
  default String pluginDisplayName() {
    return null;
  }

  /**
   * Validates the salt for this PasswordEncryptor. In most cases this is not necessary to implement this method.
   * <p>
   * Most of the password hashes will use a Base64 encoded salt.
   * <p>
   * If you are using a Bcrypt or Bcrypt like algorithm which uses a non-MIME compatible Base64 encoding you will want to
   * implement this to ensure the salt is corrected validated.
   *
   * @param salt the salt!
   * @return true if the salt is valid for this hashing implementation, false if invalid.
   */
  default boolean validateSalt(String salt) {
    // Note, the more common Base64 character set is defined at the top of this file in a regular expression.
    // You can use that as well, but it doesn't validate that the string is a properly encoded value. It only
    // ensures the string does not contain any characters what would otherwise not be in the base64 character set.
    try {
      Base64.getDecoder().decode(salt.getBytes(StandardCharsets.UTF_8));
      return true;
    } catch (Exception e) {
      return false;
    }
  }
}
