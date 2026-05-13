# -*- mode: python ; coding: utf-8 -*-

a = Analysis(
    ['server/main.py'],
    pathex=[],
    binaries=[],
    datas=[('dev', 'dev')],
    hiddenimports=[
        'server.routers', 'server.routers.import_questions', 'server.models', 'server.seed',
        'passlib.handlers.bcrypt', 'passlib.handlers', 'passlib.utils', 'passlib.utils.handlers',
        'bcrypt',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['psycopg2', 'psycopg2-binary'],
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='game',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_tracked=False,
    argv_emulation=False,
    target_arch=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='game',
)
