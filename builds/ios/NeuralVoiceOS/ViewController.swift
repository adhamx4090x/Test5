import UIKit
import WebKit
import AVFoundation

class ViewController: UIViewController, WKUIDelegate {

  var webView: WKWebView!
  var audioEngine: AVAudioEngine?
  var isRecording = false

  override func loadView() {
    let webConfiguration = WKWebViewConfiguration()
    webConfiguration.preferences.javaScriptEnabled = true
    webConfiguration.preferences.allowFileAccessFromFileURLs = true
    
    webView = WKWebView(frame: .zero, configuration: webConfiguration)
    webView.uiDelegate = self
    view = webView
  }

  override func viewDidLoad() {
    super.viewDidLoad()
    
    setupAudioSession()
    loadWebApp()
    setupNotifications()
  }

  private func setupAudioSession() {
    do {
      let audioSession = AVAudioSession.sharedInstance()
      try audioSession.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetooth])
      try audioSession.setActive(true)
    } catch {
      print("Failed to set up audio session: \(error)")
    }
  }

  private func loadWebApp() {
    let indexPath = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "www")
    if let indexPath = indexPath {
      let indexURL = URL(fileURLWithPath: indexPath)
      webView.loadFileURL(indexURL, allowingReadAccessTo: indexURL.deletingLastPathComponent())
    }
  }

  private func setupNotifications() {
    NotificationCenter.default.addObserver(self, selector: #selector(handleInterruption), name: AVAudioSession.interruptionNotification, object: nil)
  }

  @objc private func handleInterruption(_ notification: Notification) {
    guard let userInfo = notification.userInfo,
          let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
          let type = AVAudioSession.InterruptionType(rawValue: typeValue) else {
      return
    }

    switch type {
    case .began:
      pauseRecording()
    case .ended:
      if let optionsValue = userInfo[AVAudioSessionInterruptionOptionKey] as? UInt {
        let options = AVAudioSession.InterruptionOptions(rawValue: optionsValue)
        if options.contains(.shouldResume) {
          resumeRecording()
        }
      }
    @unknown default:
      break
    }
  }

  private func startRecording() {
    guard !isRecording else { return }
    
    let audioSession = AVAudioSession.sharedInstance()
    if audioSession.recordPermission != .granted {
      audioSession.requestRecordPermission { [weak self] granted in
        if granted {
          self?.beginRecording()
        }
      }
    } else {
      beginRecording()
    }
  }

  private func beginRecording() {
    isRecording = true
    // Audio recording implementation would go here
  }

  private func pauseRecording() {
    isRecording = false
  }

  private func resumeRecording() {
    if wasRecordingBeforeInterruption {
      beginRecording()
    }
  }

  private var wasRecordingBeforeInterruption = false
}

import JavaScriptCore

// Bridge between JavaScript and native code
@objc protocol JavaScriptBridgeProtocol: JSExport {
  func startRecording()
  func stopRecording()
  func pauseRecording()
  func getMicrophonePermission() -> Bool
  func getSampleRate() -> Double
  func getBufferSize() -> Int
}

@objc class JavaScriptBridge: NSObject, JavaScriptBridgeProtocol {
  weak var viewController: ViewController?

  func startRecording() {
    viewController?.startRecording()
  }

  func stopRecording() {
    viewController?.pauseRecording()
  }

  func pauseRecording() {
    viewController?.pauseRecording()
  }

  func getMicrophonePermission() -> Bool {
    return AVAudioSession.sharedInstance().recordPermission == .granted
  }

  func getSampleRate() -> Double {
    return AVAudioSession.sharedInstance().sampleRate
  }

  func getBufferSize() -> Int {
    return 4096
  }
}
