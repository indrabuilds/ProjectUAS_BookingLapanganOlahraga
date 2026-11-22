<?php

// Pesan yang dipakai form auth. Kunci lain tetap jatuh ke bahasa Inggris bawaan Laravel.
return [
    'confirmed' => 'Konfirmasi :attribute tidak cocok.',
    'current_password' => 'Password saat ini salah.',
    'email' => ':attribute harus berupa email yang valid.',
    'max' => [
        'string' => ':attribute maksimal :max karakter.',
        'numeric' => ':attribute terlalu besar.',
        'file' => ':attribute maksimal :max KB.',
    ],
    'image' => ':attribute harus berupa gambar.',
    'mimes' => ':attribute harus berformat: :values.',
    'dimensions' => 'Ukuran :attribute melebihi batas piksel.',
    'file' => ':attribute harus berupa file.',
    'in' => ':attribute tidak valid.',
    'numeric' => ':attribute harus berupa angka.',
    'gt' => [
        'numeric' => ':attribute harus lebih dari :value.',
    ],
    'min' => [
        'string' => ':attribute minimal :min karakter.',
    ],
    'required' => ':attribute wajib diisi.',
    'unique' => ':attribute sudah terdaftar.',
    'password' => [
        'letters' => ':attribute harus mengandung minimal satu huruf.',
        'numbers' => ':attribute harus mengandung minimal satu angka.',
    ],
];
