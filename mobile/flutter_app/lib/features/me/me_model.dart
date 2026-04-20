class Me {
  final String id;
  final String email;
  final String role;
  final String? name;

  Me({
    required this.id,
    required this.email,
    required this.role,
    this.name,
  });

  factory Me.fromJson(Map<String, dynamic> json) {
    return Me(
      id: json['id'],
      email: json['email'],
      role: json['role'],
      name: json['name'],
    );
  }
}
