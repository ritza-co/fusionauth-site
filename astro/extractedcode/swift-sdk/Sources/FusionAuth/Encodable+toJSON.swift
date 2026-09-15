import Foundation

extension Encodable {
    /// Converts an object to a JSON string.
    func toJSON() throws -> String? {
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted
        let data = try encoder.encode(self)
        return String(data: data, encoding: .utf8)
    }
}
