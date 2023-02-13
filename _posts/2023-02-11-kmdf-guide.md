---
layout: post
title: "KMDF developing guide"
date: 2023-02-11 14:01:00 +0900
categories: backend
comments: true
---
# TL;DR
Follow the insturctions from [Write a Hello World Windows Driver (KMDF)](https://learn.microsoft.com/en-us/windows-hardware/drivers/gettingstarted/writing-a-very-small-kmdf--driver).

# Steps
## Download the WDK
> [Download the WDK](https://learn.microsoft.com/ko-kr/windows-hardware/drivers/download-the-wdk)

1. Install Visual Studio
2. Install Windows SDK
3. Install WDK(Windos Driver Kit)

## KMDF Hello World
1. In Visual Studio, create a *Kernel Mode Driver, Empty (KMDF)* project.
2. Create a `Driver.c` file in your project, and write like below.

```cpp
#include <ntddk.h>
#include <wdf.h>
DRIVER_INITIALIZE DriverEntry;
EVT_WDF_DRIVER_DEVICE_ADD KmdfHelloWorldEvtDeviceAdd;

NTSTATUS 
DriverEntry(
    _In_ PDRIVER_OBJECT     DriverObject, 
    _In_ PUNICODE_STRING    RegistryPath
)
{
    // NTSTATUS variable to record success or failure
    NTSTATUS status = STATUS_SUCCESS;

    // Allocate the driver configuration object
    WDF_DRIVER_CONFIG config;

    // Print "Hello World" for DriverEntry
    KdPrintEx(( DPFLTR_IHVDRIVER_ID, DPFLTR_INFO_LEVEL, "KmdfHelloWorld: DriverEntry\n" ));

    // Initialize the driver configuration object to register the
    // entry point for the EvtDeviceAdd callback, KmdfHelloWorldEvtDeviceAdd
    WDF_DRIVER_CONFIG_INIT(&config, 
                           KmdfHelloWorldEvtDeviceAdd
                           );

    // Finally, create the driver object
    status = WdfDriverCreate(DriverObject, 
                             RegistryPath, 
                             WDF_NO_OBJECT_ATTRIBUTES, 
                             &config, 
                             WDF_NO_HANDLE
                             );
    return status;
}

NTSTATUS 
KmdfHelloWorldEvtDeviceAdd(
    _In_    WDFDRIVER       Driver, 
    _Inout_ PWDFDEVICE_INIT DeviceInit
)
{
    // We're not using the driver object,
    // so we need to mark it as unreferenced
    UNREFERENCED_PARAMETER(Driver);

    NTSTATUS status;

    // Allocate the device object
    WDFDEVICE hDevice;    

    // Print "Hello World"
    KdPrintEx(( DPFLTR_IHVDRIVER_ID, DPFLTR_INFO_LEVEL, "KmdfHelloWorld: KmdfHelloWorldEvtDeviceAdd\n" ));

    // Create the device object
    status = WdfDeviceCreate(&DeviceInit, 
                             WDF_NO_OBJECT_ATTRIBUTES,
                             &hDevice
                             );
    return status;
}
```
3. Build solution
4. Signing
- [how-to-sign-an-unsigned-driver-for-windows-7-x64/](https://woshub.com/how-to-sign-an-unsigned-driver-for-windows-7-x64/)
  1. Create a Self-Signed Driver Certificate
  
  ```console
  $todaydate = Get-Date
  $add3year = $todaydate.AddYears(3)
  $cert = New-SelfSignedCertificate -Subject "WOSHUB” -Type CodeSigningCert -CertStoreLocation cert:\LocalMachine\My -notafter $add3year
  $CertPassword = ConvertTo-SecureString -String “P@ss0wrd” -Force –AsPlainText
  Export-PfxCertificate -Cert $cert -FilePath myDrivers.pfx -Password $CertPassword
  ```
  
  2. Add the certificate to the Trusted Root store and to the Trusted Publisher certificates:

  ```console
  $certFile = Export-Certificate -Cert $cert -FilePath drivecert.cer
  Import-Certificate -CertStoreLocation Cert:\LocalMachine\AuthRoot -FilePath $certFile.FullName
  Import-Certificate -CertStoreLocation Cert:\LocalMachine\TrustedPublisher -FilePath $certFile.FullName
  ```

  3. Creating a Catalog File (CAT) for Signing a Driver Package
  - Default inf2cat locaiton: `C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x86\Inf2Cat.exe`

  ```console
  PS C:\> cd "C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x86"
  PS C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x86> .\Inf2Cat.exe /driver:"C:\Drivers" /os:10_X64 /verbose
  ```

  4. Signing the Driver Package with a Self-Signed Certificate

  ```console
  .\signtool /fd SHA256 sign /f C:\DriverCert\myDrivers.pfx /p P@ss0wrd /t http://timestamp.comodoca.com/authenticode /v C:\DriverCert\xg20\xg20gr.cat
  .\SignTool verify /v /pa c:\DriverCert\xg\xg20gr.cat
  ```
    
    - http://timestamp.comodoca.com/authenticode
    - http://timestamp.globalsign.com/scripts/timstamp.dll
    - http://timestamp.verisign.com/scripts/timstamp.dll
    - http://tsa.starfieldtech.com
    - http://www.startssl.com/timestamp




5. Install using `devcon.exe`
- Default setup location: `C:\Program Files (x86)\Windows Kits\10\Tools\10.0.22621.0\x64\devcon.exe`
- Default log location: `%windir%\inf\setupapi.dev.log`
> You should run console as administrator.
>
> ```console
> devcon install <INF file> <hardware ID>
> ```

```console
.\devcon.exe install .\KmdfHelloWorld.inf Root\KmdfHelloWorld

Device node created. Install is complete when drivers are installed...
Updating drivers for Root\KmdfHelloWorld from C:\KmdfHelloWorld\KmdfHelloWorld.inf.
Drivers installed successfully.
```

5. Debug using `WinDbg.exe`
- Default setup location: `C:\Program Files (x86)\Windows Kits\10\Debuggers\x64\windbg.exe`
> [performing-local-kernel-debugging](https://learn.microsoft.com/en-us/windows-hardware/drivers/debugger/performing-local-kernel-debugging)

```console
WinDbg -k net:port=50000,key=1.2.3.4
```