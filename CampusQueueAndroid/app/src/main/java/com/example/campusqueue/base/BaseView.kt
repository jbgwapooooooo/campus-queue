package com.example.campusqueue.base

/**
 * Base interface for all MVP Views.
 *
 * Every Activity acting as a View in the MVP pattern must implement this interface.
 * - [showLoading] — display a progress indicator while the Presenter fetches data
 * - [hideLoading] — hide the progress indicator once data is ready
 * - [showError]   — display an error message to the user
 *
 * @param T The Presenter type associated with this View
 */
interface BaseView<T> {
    fun showLoading()
    fun hideLoading()
    fun showError(message: String)
}
